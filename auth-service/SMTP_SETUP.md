# تنظیم SMTP برای ارسال ایمیل OTP

## متغیرهای محیطی مورد نیاز

شما باید متغیرهای زیر را در فایل `.env` خود تنظیم کنید:

```env
# تنظیمات SMTP برای ارسال ایمیل OTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM_EMAIL=your_email@gmail.com
```

## تنظیمات مختلف ارائه‌دهندگان ایمیل

### Gmail

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

**نکته:** برای Gmail باید از App Password استفاده کنید نه رمز عبور اصلی.

#### نحوه دریافت App Password از Gmail:

1. به Google Account Settings بروید
2. Security → 2-Step Verification را فعال کنید
3. App passwords را انتخاب کنید
4. یک App password جدید برای Mail ایجاد کنید

### Outlook/Hotmail

```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@outlook.com
SMTP_PASS=your_password
```

### Yahoo

```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@yahoo.com
SMTP_PASS=your_app_password
```

### سرور SMTP سفارشی

```env
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your_email@yourdomain.com
SMTP_PASS=your_password
```

## توضیحات پارامترها

- **SMTP_HOST**: آدرس سرور SMTP
- **SMTP_PORT**: پورت سرور SMTP (معمولاً 587 برای TLS یا 465 برای SSL)
- **SMTP_SECURE**: true برای SSL (پورت 465) یا false برای TLS (پورت 587)
- **SMTP_USER**: نام کاربری یا ایمیل برای احراز هویت
- **SMTP_PASS**: رمز عبور یا App Password
- **SMTP_FROM_EMAIL**: آدرس ایمیل فرستنده

## تست تنظیمات

پس از تنظیم متغیرهای محیطی، سرویس auth را راه‌اندازی کنید. در صورت موفقیت‌آمیز بودن تنظیمات، پیام زیر در لاگ نمایش داده می‌شود:

```
[EmailService] SMTP Connection successful
```

در صورت وجود مشکل، پیام خطا نمایش داده می‌شود:

```
[EmailService] SMTP Connection failed: Error details...
```

## استفاده از API

### ارسال کد OTP

```javascript
// Message Pattern: 'auth/send-otp'
{
  "email": "user@example.com"
}
```

### تایید کد OTP

```javascript
// Message Pattern: 'auth/verify-otp'
{
  "email": "user@example.com",
  "otp": "123456"
}
```

### ورود با ایمیل و OTP

```javascript
// Message Pattern: 'auth/email-login'
{
  "email": "user@example.com",
  "otp": "123456"
}
```

## نکات امنیتی

1. هرگز رمز عبور یا App Password را در کد یا repository ذخیره نکنید
2. از App Password برای Gmail استفاده کنید
3. کدهای OTP تنها ۵ دقیقه معتبر هستند
4. حداکثر ۳ تلاش برای هر کد OTP مجاز است
5. نمی‌توان کد OTP جدید درخواست کرد تا کد قبلی منقضی نشده باشد
