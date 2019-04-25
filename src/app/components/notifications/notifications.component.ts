import { Component, OnInit } from '@angular/core';
import { TokenService } from 'src/app/services/token.service';
import { UsersService } from 'src/app/services/users.service';
import io from 'socket.io-client';
import * as moment from 'moment';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {
  socket: any;
  user: any;
  notifications = [];

  constructor(private tokenService: TokenService, private usersService: UsersService) {
    this.socket = io('http://localhost:3000');
  }

  ngOnInit() {
    this.user = this.tokenService.GetPayload();
    this.GetUser();
    this.socket.on('refreshPage', () => {
      this.GetUser();
    });
  }

  GetUser() {
    this.usersService.GetUserById(this.user._id).subscribe(data => {
      this.notifications = data.result.notifications.reverse();
    });
    // this.usersService.GetUserByUsername(this.user.username).subscribe(data => {
    //   console.log(data);
    // });
  }

  MarkNotification(data) {
    this.usersService.MarkNotification(data._id).subscribe(value => {
      this.socket.emit('refresh', {});
      // this.GetUser();
    });
  }

  DeleteNotification(data) {
    this.usersService.MarkNotification(data._id, true).subscribe(value => {
      this.socket.emit('refresh', {});
      // this.GetUser();
    });
  }

  TimeFromNow(time) {
    return moment(time).fromNow();
  }
}
