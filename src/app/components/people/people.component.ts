import { Component, OnInit } from '@angular/core';
import { UsersService } from 'src/app/services/users.service';
import _ from 'lodash';
import { TokenService } from 'src/app/services/token.service';
import io from 'socket.io-client';
import { Router } from '@angular/router';
import { ValueConverter } from '@angular/compiler/src/render3/view/template';

@Component({
  selector: 'app-people',
  templateUrl: './people.component.html',
  styleUrls: ['./people.component.css']
})
export class PeopleComponent implements OnInit {
  socket: any;
  users = [];
  loggedInUser: any;
  userArr = [];
  onlineusers = [];

  constructor(private usersService: UsersService, private tokenService: TokenService, private router: Router) {
    this.socket = io('http://localhost:3000');
  }

  ngOnInit() {
    this.loggedInUser = this.tokenService.GetPayload();
    this.GetUsers();
    this.GetUserById();

    this.socket.on('refreshPage', () => {
      this.GetUsers();
      this.GetUserById();
    });
  }

  GetUsers() {
    this.usersService.GetAllUsers().subscribe(data => {
      _.remove(data.result, { username: this.loggedInUser.username });
      this.users = data.result;
    });
  }

  FollowUser(user) {
    this.usersService.FollowUser(user._id).subscribe(data => {
      console.log(data);
      this.socket.emit('refresh', {});
    });
  }

  GetUserById() {
    this.usersService.GetUserById(this.loggedInUser._id).subscribe(data => {
      if (data.result) {
        this.userArr = data.result.following;
      }
    });
  }

  CheckInArray(arr, id) {
    const result = _.find(arr, ['userFollowed._id', id]);
    if (result) {
      return true;
    }
    return false;
  }

  online(event) {
    this.onlineusers = event;
  }

  CheckIfOnline(name) {
    const result = _.indexOf(this.onlineusers, name);
    if (result > -1) {
      return true;
    }
    return false;
  }

  ViewUser(user) {
    this.router.navigate([user.username]);
    if (this.loggedInUser.username !== user.username) {
      this.usersService.ProfileNotification(user._id).subscribe(
        data => {
          this.socket.emit('refresh', {});
        },
        err => console.log(err)
      );
    }
  }
}
