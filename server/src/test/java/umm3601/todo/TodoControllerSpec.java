package umm3601.todo;

import static com.mongodb.client.model.Filters.eq;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.google.common.collect.ImmutableMap;
import com.mockrunner.mock.web.MockHttpServletRequest;
import com.mockrunner.mock.web.MockHttpServletResponse;
import com.mongodb.MongoClientSettings;
import com.mongodb.ServerAddress;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;

import org.bson.Document;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import io.javalin.http.BadRequestResponse;
import io.javalin.http.Context;
import io.javalin.http.NotFoundResponse;
import io.javalin.http.util.ContextUtil;
import io.javalin.plugin.json.JavalinJson;


/**
* Tests the logic of the TodoController
*
* @throws IOException
*/
public class TodoControllerSpec {

  MockHttpServletRequest mockReq = new MockHttpServletRequest();
  MockHttpServletResponse mockRes = new MockHttpServletResponse();

  private TodoController todoController;

  private ObjectId samsId;

  static MongoClient mongoClient;
  static MongoDatabase db;

  static ObjectMapper jsonMapper = new ObjectMapper();

  @BeforeAll
  public static void setupAll() {
    String mongoAddr = System.getenv().getOrDefault("MONGO_ADDR", "localhost");

    mongoClient = MongoClients.create(
    MongoClientSettings.builder()
    .applyToClusterSettings(builder ->
    builder.hosts(Arrays.asList(new ServerAddress(mongoAddr))))
    .build());

    db = mongoClient.getDatabase("test");
  }


  @BeforeEach
  public void setupEach() throws IOException {

    mockReq.resetAll();
    mockRes.resetAll();

    MongoCollection<Document> todoDocuments = db.getCollection("todos");
    todoDocuments.drop();
    List<Document> testTodos = new ArrayList<>();
    testTodos.add(
      new Document()
        .append("owner", "Blanche")
        .append("status", false)
        .append("body", "In sunt ex non tempor cillum commodo")
        .append("category", "software design"));
    testTodos.add(
      new Document()
        .append("owner", "Pat")
        .append("status", true)
        .append("category", "homework")
        .append("body", "blah"));
    testTodos.add(
      new Document()
        .append("owner", "James")
        .append("status", false)
        .append("body", "In sunt blah non tempor cillum commodo")
        .append("category", "groceries"));

    samsId = new ObjectId();
    Document sam =
      new Document()
        .append("_id", samsId)
        .append("owner", "Sam")
        .append("status", true)
        .append("body", "In sunt blah non tempor cillum blahblah")
        .append("category", "groceries");

    todoDocuments.insertMany(testTodos);
    todoDocuments.insertOne(sam);

    todoController = new TodoController(db);
  }

  @AfterAll
  public static void teardown() {
    db.drop();
    mongoClient.close();
  }

  @Test
  public void GetAllTodos() throws IOException {

    // Create our fake Javalin context
    Context ctx = ContextUtil.init(mockReq, mockRes, "api/todos");
    todoController.getTodos(ctx);


    assertEquals(200, mockRes.getStatus());

    String result = ctx.resultString();
    assertEquals(db.getCollection("todos").countDocuments(), JavalinJson.fromJson(result, Todo[].class).length);
  }

  @Test
  public void GetTodosByOwner() throws IOException {

    // Set the query string to test with
    mockReq.setQueryString("owner=Pat");

    // Create our fake Javalin context
    Context ctx = ContextUtil.init(mockReq, mockRes, "api/todos");

    todoController.getTodos(ctx);

    assertEquals(200, mockRes.getStatus()); // The response status should be 200

    String result = ctx.resultString();
    Todo[] resultTodos = JavalinJson.fromJson(result, Todo[].class);

    assertEquals(1, resultTodos.length); // There should be one todo returned
    for (Todo todo : resultTodos) {
      assertEquals("Pat", todo.owner); // Every todo should be owned by Pat
    }
  }

  @Test
  public void GetTodobyStatus() throws IOException {

    mockReq.setQueryString("status=false");
    Context ctx = ContextUtil.init(mockReq, mockRes, "api/todos");
    todoController.getTodos(ctx);

    assertEquals(200, mockRes.getStatus());
    String result = ctx.resultString();

    Todo[] resultTodos= JavalinJson.fromJson(result, Todo[].class);

    assertEquals(2, resultTodos.length); // There should be two todos returned
    for (Todo todo : resultTodos) {
      assertEquals(false, todo.status);
    }
  }

  @Test
  public void GetTodosByStatusAndOwner() throws IOException {

    mockReq.setQueryString("owner=James&status=false");
    Context ctx = ContextUtil.init(mockReq, mockRes, "api/todos");
    todoController.getTodos(ctx);

    assertEquals(200, mockRes.getStatus());
    String result = ctx.resultString();
    Todo[] resultTodos = JavalinJson.fromJson(result, Todo[].class);

    assertEquals(1, resultTodos.length); // There should be one todo returned
    for (Todo todo : resultTodos) {
      assertEquals("James", todo.owner);
      assertEquals(false, todo.status);
    }
  }


  @Test
  public void GetTodoWithExistentId() throws IOException {

    String testID = samsId.toHexString();

    Context ctx = ContextUtil.init(mockReq, mockRes, "api/todos/:id", ImmutableMap.of("id", testID));
    todoController.getTodo(ctx);

    assertEquals(200, mockRes.getStatus());

    String result = ctx.resultString();
    Todo resultTodo = JavalinJson.fromJson(result, Todo.class);

    assertEquals(resultTodo._id, samsId.toHexString());
    assertEquals(resultTodo.owner, "Sam");
  }

  @Test
  public void GetTodoWithBadId() throws IOException {

    Context ctx = ContextUtil.init(mockReq, mockRes, "api/todos/:id", ImmutableMap.of("id", "bad"));

    assertThrows(BadRequestResponse.class, () -> {
      todoController.getTodo(ctx);
    });
  }

  @Test
  public void GetTodoWithNonexistentId() throws IOException {

    Context ctx = ContextUtil.init(mockReq, mockRes, "api/todos/:id", ImmutableMap.of("id", "58af3a600343927e48e87335"));

    assertThrows(NotFoundResponse.class, () -> {
      todoController.getTodo(ctx);
    });
  }

  @Test
  public void AddTodo() throws IOException {

    String testNewTodo = "{"
      + "\"owner\": \"Test Todo\","
      + "\"status\": true,"
      + "\"category\": \"groceries\","
      + "\"body\": \"blah\","
      + "}";

    mockReq.setBodyContent(testNewTodo);
    mockReq.setMethod("POST");

    Context ctx = ContextUtil.init(mockReq, mockRes, "api/todos");

    todoController.addNewTodo(ctx);

    assertEquals(201, mockRes.getStatus());

    String result = ctx.resultString();
    String id = jsonMapper.readValue(result, ObjectNode.class).get("id").asText();
    assertNotEquals("", id);
    System.out.println(id);

    assertEquals(1, db.getCollection("todos").countDocuments(eq("_id", new ObjectId(id))));

    //verify todo was added to the database and the correct ID
    Document addedTodo = db.getCollection("todos").find(eq("_id", new ObjectId(id))).first();
    assertNotNull(addedTodo);
    assertEquals("Test Todo", addedTodo.getString("owner"));
    assertEquals(true, addedTodo.getBoolean("status"));
    assertEquals("groceries", addedTodo.getString("category"));
    assertEquals("blah", addedTodo.getString("body"));
  }

  @Test
  public void AddInvalidStatusTodo() throws IOException {
    String testNewTodo = "{"
      + "\"owner\": \"Test Todo\","
      + "\"status\": \"notaboolean\","
      + "\"body\": \"blah\","
      + "\"category\": \"homework\","
      + "}";
    mockReq.setBodyContent(testNewTodo);
    mockReq.setMethod("POST");
    Context ctx = ContextUtil.init(mockReq, mockRes, "api/todos");

    assertThrows(BadRequestResponse.class, () -> {
      todoController.addNewTodo(ctx);
    });
  }

  @Test
  public void AddInvalidTodoOwner() throws IOException {

    String testNewTodo = "{"
      + "\"status\": true,"
      + "\"body\": \"blah\","
      + "\"category\": \"groceries\","
      + "}";

    mockReq.setBodyContent(testNewTodo);
    mockReq.setMethod("POST");
    Context ctx = ContextUtil.init(mockReq, mockRes, "api/todos");

    assertThrows(BadRequestResponse.class, () -> {
      todoController.addNewTodo(ctx);
    });
  }

  @Test
  public void AddInvalidTodoCategory() throws IOException {
    String testNewTodo = "{"
      + "\"owner\": \"Test Todo\","
      + "\"status\": false,"
      + "\"body\": \"blah\","
      + "}";

    mockReq.setBodyContent(testNewTodo);
    mockReq.setMethod("POST");
    Context ctx = ContextUtil.init(mockReq, mockRes, "api/todos");

    assertThrows(BadRequestResponse.class, () -> {
      todoController.addNewTodo(ctx);
    });
  }

  @Test
  public void AddInvalidTodoBody() throws IOException {
    String testNewTodo = "{"
      + "\"owner\": \"Test Todo\","
      + "\"status\": : false,"
      + "\"category\": \"homework\","
      + "}";
    mockReq.setBodyContent(testNewTodo);
    mockReq.setMethod("POST");
    Context ctx = ContextUtil.init(mockReq, mockRes, "api/todos");

    assertThrows(BadRequestResponse.class, () -> {
      todoController.addNewTodo(ctx);
    });
  }

  @Test
  public void DeleteTodo() throws IOException {

    String testID = samsId.toHexString();

    // Todo exists before deletion
    assertEquals(1, db.getCollection("todos").countDocuments(eq("_id", new ObjectId(testID))));

    Context ctx = ContextUtil.init(mockReq, mockRes, "api/todos/:id", ImmutableMap.of("id", testID));
    todoController.deleteTodo(ctx);

    assertEquals(200, mockRes.getStatus());

    // Todo is no longer in the database
    assertEquals(0, db.getCollection("todos").countDocuments(eq("_id", new ObjectId(testID))));
  }

}
