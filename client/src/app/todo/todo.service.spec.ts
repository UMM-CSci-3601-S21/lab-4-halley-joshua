import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Todo } from './todo';
import { TodoService } from './todo.service';

describe('TodoService', () => {
  // A small collection of test users
  const testTodos: Todo[] = [
    {
      _id: 'chris_id',
      owner: 'Chris',
      status: false,
      body: 'In sunt ex non tempor cillum commodo amet incididunt enim qui commodo quis.',
      category: 'groceries'
    },
    {
      _id: 'pat_id',
      owner: 'Pat',
      status: true,
      body: 'Ipsum esse est ullamco magna tempor anim laborum non officia deserunt veniam commodo. Aute minim incididunt ex commodo.',
      category: 'video games'
    },
    {
      _id: 'jamie_id',
      owner: 'Jamie',
      status: true,
      body: 'Incididunt enim ea sit qui esse magna eu.',
      category: 'homework'
    }
  ];
  let todoService: TodoService;
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {

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

    it('calls `api/todos` when `getTodos()` is called with no parameters', () => {

      todoService.getTodos().subscribe(
        todos => expect(todos).toBe(testTodos)
      );

      const req = httpTestingController.expectOne(todoService.todoUrl);

      expect(req.request.method).toEqual('GET');

      expect(req.request.params.keys().length).toBe(0);

      req.flush(testTodos);
    });
  });

  describe('addTodo()', () => {

    it('addTodo() posts to api/todos', () => {

    todoService.addTodo(testTodos[1]).subscribe(
      id => expect(id).toBe('testid')
    );

    const req = httpTestingController.expectOne(todoService.todoUrl);

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual(testTodos[1]);

    req.flush({id: 'testid'});
    });
  });

  describe('getTodoByID()', () => {
    it('calls api/todos/id with the correct ID', () => {

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
  describe('Calling getTodos() with parameters correctly forms the HTTP request', () => {

    it('correctly calls api/todos with filter parameter \'status\'', () => {
      todoService.getTodos({ status: 'incomplete' }).subscribe(
        todos => expect(todos).toBe(testTodos)
      );

      const req = httpTestingController.expectOne(
        (request) => request.url.startsWith(todoService.todoUrl) && request.params.has('status')
      );

      expect(req.request.method).toEqual('GET');

      expect(req.request.params.get('status')).toEqual('false');

      req.flush(testTodos);
    });

    it('correctly calls api/todos with filter parameter \'owner\'', () => {
      todoService.getTodos({ owner: 'Chris' }).subscribe(
        todos => expect(todos).toBe(testTodos)
      );

      const req = httpTestingController.expectOne(
        (request) => request.url.startsWith(todoService.todoUrl) && request.params.has('owner')
      );

      expect(req.request.method).toEqual('GET');

      expect(req.request.params.get('owner')).toEqual('Chris');

      req.flush(testTodos);
    });

    it('correctly calls api/todos with multiple filter parameters', () => {

      todoService.getTodos({ owner: 'Chris', status: 'incomplete'}).subscribe(
        todos => expect(todos).toBe(testTodos)
      );

      const req = httpTestingController.expectOne(
        (request) => request.url.startsWith(todoService.todoUrl)
          && request.params.has('owner') && request.params.has('status')
      );

      expect(req.request.method).toEqual('GET');

      expect(req.request.params.get('owner')).toEqual('Chris');
      expect(req.request.params.get('status')).toEqual('false');

      req.flush(testTodos);
    });
  });



  it('filterTodos() filters by category', () => {
    expect(testTodos.length).toBe(3);
    const todoCategory = 'homework';
    expect(todoService.filterTodos(testTodos, { category: todoCategory }).length).toBe(1);
  });

  it('filterTodos() filters by keyWord', () => {
    expect(testTodos.length).toBe(3);
    const todoKeyWord = 'qui';
    expect(todoService.filterTodos(testTodos, { keyWord: todoKeyWord }).length).toBe(2);
  });

  it('filterTodos() limits todos', () => {
    expect(testTodos.length).toBe(3);
    const todoLimit = 1;
    expect(todoService.filterTodos(testTodos, {limit: todoLimit}).length).toBe(1);
  });

  it('filterTodos() filters by limit, category and keyWord', () => {
    expect(testTodos.length).toBe(3);
    const todoCategory = 'groceries';
    const todoKeyWord = 'qui';
    const todoLimit = 1;
    expect(todoService.filterTodos(testTodos, { category: todoCategory, keyWord: todoKeyWord, limit: todoLimit }).length).toBe(1);
  });
});

