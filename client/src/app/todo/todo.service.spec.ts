import { TestBed } from '@angular/core/testing';
import { TodoService } from './todo.service';
import { Todo } from './todo';
import { HttpClient} from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('todoService', () => {
  const testTodos: Todo[] = [
    // test todos
  {
    _id: 'blanche_id',
    owner: 'Blanche',
    status: false,
    body: 'blah',
    category: 'software design'
  },
  {
    _id: 'fry_id',
    owner: 'Fry',
    status: false,
    body: 'blah blah',
    category: 'video games'
  },
  {
    _id: 'barry_id',
    owner: 'Barry',
    status: true,
    body: 'This is the test body.',
    category: 'homework'
  }
];
let todoService: TodoService;

// These are used to mock the HTTP requests
let httpClient: HttpClient;
let httpTestingController: HttpTestingController;

  beforeEach(() => {
    // Set up the mock handling of the HTTP requests
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    todoService = new TodoService(httpClient);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  describe('getTodos()', () => {

    it('calls `api/Todos` when `getTodos()` is called with no parameters', () => {
      todoService.getTodos().subscribe(
        todo => expect(todo).toBe(testTodos)
      );

      const req = httpTestingController.expectOne(todoService.todoUrl);
      expect(req.request.method).toEqual('GET');
      expect(req.request.params.keys().length).toBe(0);
      req.flush(testTodos);
    });

    describe('Calling getTodos() with parameters correctly forms the HTTP request', () => {
      it('correctly calls api/Todos with filter parameter \'incomplete\'', () => {
        todoService.getTodos({ status: 'incomplete' }).subscribe(
          todo => expect(todo).toBe(testTodos)
        );

        const req = httpTestingController.expectOne(
          (request) => request.url.startsWith(todoService.todoUrl) && request.params.has('status')
        );

        expect(req.request.method).toEqual('GET');

        expect(req.request.params.get('status')).toEqual('incomplete');

        req.flush(testTodos);
      });
    });
  });

  describe('getTodoByID()', () => {
    it('calls api/Todos/id with the correct ID', () => {
      const targetTodo: Todo = testTodos[1];
      const targetId: string = targetTodo._id;

      todoService.getTodoById(targetId).subscribe(
        todo => expect(todo).toBe(targetTodo)
      );

      const expectedUrl: string = todoService.todoUrl + '/' + targetId;
      const req = httpTestingController.expectOne(expectedUrl);
      expect(req.request.method).toEqual('GET');

      req.flush(targetTodo);
    });
  });

  describe('filterTodos()', () => {
    it('filters by owner', () => {
      const todoOwner = 'Fry';
      const filteredTodos = todoService.filterTodos(testTodos, { owner: todoOwner });
      expect(filteredTodos.length).toBe(1);
      filteredTodos.forEach(todo => {
        expect(todo.owner.indexOf(todoOwner)).toBeGreaterThanOrEqual(0);
      });
    });

    it('filters by category', () => {
      const todoCategory = 'homework';
      const filteredTodos = todoService.filterTodos(testTodos, { category: todoCategory });
      expect(filteredTodos.length).toBe(1);
      filteredTodos.forEach(todo => {
        expect(todo.category.indexOf(todoCategory)).toBeGreaterThanOrEqual(0);
      });
    });

    it('filters by keyWord', () => {
      const todoKeyWord = 'blah';
      const filteredTodos = todoService.filterTodos(testTodos, { keyWord: todoKeyWord });
      expect(filteredTodos.length).toBe(2);
      filteredTodos.forEach(todo => {
        expect(todo.body.indexOf(todoKeyWord)).toBeGreaterThanOrEqual(0);
      });
    });

    it('filters by owner, category, and keyWord', () => {
      const todoOwner = 'Barry';
      const todoCategory = 'homework';
      const todoKeyWord = 'test';
      const filters = { owner: todoOwner, category: todoCategory };
      const filteredTodos = todoService.filterTodos(testTodos, filters);
      expect(filteredTodos.length).toBe(1);
      filteredTodos.forEach(todo => {
        expect(todo.owner.indexOf(todoOwner)).toBeGreaterThanOrEqual(0);
        expect(todo.category.indexOf(todoCategory)).toBeGreaterThanOrEqual(0);
        expect(todo.body.indexOf(todoKeyWord)).toBeGreaterThanOrEqual(0);
      });
    });
  });
});


