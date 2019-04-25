import { Component, OnInit, AfterViewInit } from '@angular/core';
import * as M from 'materialize-css';
import { ActivatedRoute } from '@angular/router';
import { UsersService } from 'src/app/services/users.service';
import * as moment from 'moment';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { PostService } from 'src/app/services/post.service';
import io from 'socket.io-client';

@Component({
  selector: 'app-view-user',
  templateUrl: './view-user.component.html',
  styleUrls: ['./view-user.component.css']
})
export class ViewUserComponent implements OnInit, AfterViewInit {
  tabElement: any;
  postsTab = false;
  followingTab = false;
  followersTab = false;
  posts = [];
  following = [];
  followers = [];
  user: any;
  name: any;
  postValue: any;
  modalElement: any;
  editForm: FormGroup;
  socket: any;

  constructor(
    private route: ActivatedRoute,
    private usersService: UsersService,
    private postService: PostService,
    private fb: FormBuilder
  ) {
    this.socket = io('http://localhost:3000');
  }

  ngOnInit() {
    this.postsTab = true;
    const tabs = document.querySelector('.tabs');
    M.Tabs.init(tabs, {});
    this.tabElement = document.querySelector('.nav-content');

    this.modalElement = document.querySelector('.modal');
    M.Modal.init(this.modalElement, {});

    this.route.params.subscribe(params => {
      this.name = params.name;
      this.GetUserData(this.name);
    });
    this.socket.on('refreshPage', data => {
      this.route.params.subscribe(params => {
        this.name = params.name;
        this.GetUserData(this.name);
      });
    });

    this.InitEditForm();
  }

  ngAfterViewInit() {
    this.tabElement.style.display = 'none';
  }

  ChangeTab(value) {
    if (value === 'post') {
      this.postsTab = true;
      this.followingTab = false;
      this.followersTab = false;
    }

    if (value === 'following') {
      this.postsTab = false;
      this.followingTab = true;
      this.followersTab = false;
    }

    if (value === 'followers') {
      this.postsTab = false;
      this.followingTab = false;
      this.followersTab = true;
    }
  }

  GetUserData(name) {
    this.usersService.GetUserByUsername(name).subscribe(
      data => {
        this.user = data.result;
        this.posts = data.result.posts.reverse();
        this.followers = data.result.followers;
        this.following = data.result.following;

        console.log(data);
      },
      err => console.log(err)
    );
  }

  TimeFromNow(time) {
    return moment(time).fromNow();
  }

  OpenModal(post) {
    this.postValue = post;
  }

  SubmitEditedPost() {
    const body = {
      id: this.postValue.postId._id,
      post: this.editForm.value.editedPost
    };
    this.postService.EditPost(body).subscribe(
      data => {
        this.socket.emit('refresh', {});
      },
      err => console.log(err)
    );
    M.Modal.getInstance(this.modalElement).close();
    this.editForm.reset();
  }

  CloseModal() {
    M.Modal.getInstance(this.modalElement).close();
    this.editForm.reset();
  }

  InitEditForm() {
    this.editForm = this.fb.group({
      editedPost: ['', Validators.required]
    });
  }

  DeletePost() {
    this.postService.DeletePost(this.postValue.postId._id).subscribe(
      data => {
        console.log(data);
        this.socket.emit('refresh', {});
      },
      err => console.log(err)
    );
    M.Modal.getInstance(this.modalElement).close();
  }
}
