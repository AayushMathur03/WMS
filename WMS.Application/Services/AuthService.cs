using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using WMS.Application.DTOs.Auth;
using WMS.Application.Services.Interfaces;
using WMS.Domain.Interfaces;

namespace WMS.Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUnitOfWork _uow;
        private readonly IConfiguration _config;

        public AuthService(IUnitOfWork uow, IConfiguration config)
        {
            _uow = uow;
            _config = config;
        }

        public async Task<LoginResponseDto?> LoginAsync(LoginRequestDto dto)
        {
            var users = await _uow.UserLogins.GetAllAsync();
            var user = users.FirstOrDefault(u => u.Username == dto.Username);

            if (user == null) return null;
            if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash)) return null;

            // Update last login
            user.LastLogin = DateTime.Now;
            await _uow.UserLogins.UpdateAsync(user);
            await _uow.SaveChangesAsync();

            var roles = await _uow.Roles.GetAllAsync();
            var role = roles.FirstOrDefault(r => r.RoleId == user.RoleId);

            var token = GenerateToken(user.UserId, user.Username, role?.RoleName ?? "Employee", user.EmployeeId);
            var expiry = DateTime.UtcNow.AddHours(8);

            return new LoginResponseDto
            {
                Token = token,
                Username = user.Username,
                Role = role?.RoleName ?? "Employee",
                EmployeeId = user.EmployeeId,
                Expiry = expiry
            };
        }

        public async Task<bool> ChangePasswordAsync(int userId, ChangePasswordDto dto)
        {
            var users = await _uow.UserLogins.GetAllAsync();
            var user = users.FirstOrDefault(u => u.UserId == userId);

            if (user == null) return false;
            if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
                throw new ArgumentException("Current password is incorrect.");

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            await _uow.UserLogins.UpdateAsync(user);
            await _uow.SaveChangesAsync();
            return true;
        }

        private string GenerateToken(int userId, string username, string role, int employeeId)
        {
            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
                new Claim(ClaimTypes.Name, username),
                new Claim(ClaimTypes.Role, role),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim("EmployeeId", employeeId.ToString())
            };

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(8),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
