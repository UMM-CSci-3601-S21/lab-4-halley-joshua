import { Input } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { Todo } from './todo';

@Component({
  selector: 'app-todo-card',
  templateUrl: './todo-card.component.html',
  styleUrls: ['./todo-card.component.scss']
})
export class TodoCardComponent implements OnInit {

  @Input() todo: Todo;
  @Input() simple?: boolean = false;

  constructor() { }

  ngOnInit(): void {
  }

}
