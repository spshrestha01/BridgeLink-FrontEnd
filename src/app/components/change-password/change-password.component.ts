import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UsersService } from 'src/app/services/users.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit {
  passwordForm: FormGroup;

  constructor(private fb: FormBuilder, private usersServive: UsersService) {}

  ngOnInit() {
    this.Init();
  }

  Init() {
    this.passwordForm = this.fb.group(
      {
        cpassword: ['', Validators.required],
        newPassword: ['', Validators.required],
        confirmPassword: ['', Validators.required]
      },
      {
        validator: this.Validate.bind(this)
      }
    );
  }

  Validate(passwordFormGroup: FormGroup) {
    const new_password = passwordFormGroup.controls.newPassword.value;
    const confrim_password = passwordFormGroup.controls.confirmPassword.value;

    if (confrim_password.length <= 0) {
      return null;
    }

    if (confrim_password !== new_password) {
      return {
        doesNotMatch: true
      };
    }

    return null;
  }

  ChangePassword() {
    this.usersServive.ChangePassword(this.passwordForm.value).subscribe(
      data => {
        // this.passwordForm.reset();
        console.log(data);
      },
      err => console.log(err)
    );
  }
}
