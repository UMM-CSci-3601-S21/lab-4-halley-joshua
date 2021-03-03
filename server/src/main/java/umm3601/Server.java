package umm3601;

import java.util.Arrays;

import com.mongodb.MongoClientSettings;
import com.mongodb.ServerAddress;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoDatabase;

import io.javalin.Javalin;
import io.javalin.core.util.RouteOverviewPlugin;

import umm3601.user.UserController;
import umm3601.todo.TodoController;

public class Server {

  static String appName = "CSCI 3601 Iteration Template";

  public static void main(String[] args) {

    String mongoAddr = System.getenv().getOrDefault("MONGO_ADDR", "localhost");
    String databaseName = System.getenv().getOrDefault("MONGO_DB", "dev");

    MongoClient mongoClient
      = MongoClients.create(MongoClientSettings
        .builder()
        .applyToClusterSettings(builder -> builder.hosts(Arrays.asList(new ServerAddress(mongoAddr))))
        .build());

    MongoDatabase database = mongoClient.getDatabase(databaseName);

    UserController userController = new UserController(database);
    TodoController todoController = new TodoController(database);

    Javalin server = Javalin.create(config -> {
      config.registerPlugin(new RouteOverviewPlugin("/api"));
    });

    server.events(event -> {
      event.serverStartFailed(mongoClient::close);
      event.serverStopped(mongoClient::close);
    });
    Runtime.getRuntime().addShutdownHook(new Thread(() -> {
      server.stop();
    }));

    server.start(4567);

    // List users, filtered using query parameters
    server.get("/api/users", userController::getUsers);

    // Get the specified user
    server.get("/api/users/:id", userController::getUser);

    // Delete the specified user
    server.delete("/api/users/:id", userController::deleteUser);

    // Add new user with the user info being in the JSON body
    // of the HTTP request
    server.post("/api/users", userController::addNewUser);

    // List todos, filtered using query parameters
    server.get("/api/todos", todoController::getTodos);

    // Get the specified todo
    server.get("/api/todos/:id", todoController::getTodo);

    // Add new todo with the todo info being in the JSON body
    // of the HTTP request
    server.post("/api/todos", todoController::addNewTodo);

    server.exception(Exception.class, (e, ctx) -> {
      ctx.status(500);
    });
  }
}
