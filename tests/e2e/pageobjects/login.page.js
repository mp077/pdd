const { driver, $ } = require('@wdio/globals');

class LoginPage {
    get inputEmail() {
        if (driver.isMobile) {
            return $('//android.widget.EditText[contains(@text, "doctor@clinic.com")]|//android.widget.EditText[1]');
        }
        return $('input[type="email"], input[placeholder="doctor@clinic.com"]');
    }

    get inputPassword() {
        if (driver.isMobile) {
            return $('//android.widget.EditText[contains(@password, "true")]|//android.widget.EditText[2]');
        }
        return $('input[type="password"], input[placeholder="••••••••"]');
    }

    get btnSignIn() {
        if (driver.isMobile) {
            return $('~Sign In'); 
        }
        return $('//*[contains(text(), "Sign In")]');
    }

    async login(email, password) {
        await this.inputEmail.setValue(email);
        await this.inputPassword.setValue(password);
        await this.btnSignIn.click();
    }
}

module.exports = new LoginPage();
