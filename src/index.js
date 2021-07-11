const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const userVerify = users.find(user => user.username === username);
  if (!userVerify) {
    return response.status(404).json({ error: "Error user could not be found" });
  }
  request.user = userVerify;
  return next();




}

app.post('/users', (request, response) => {

  const { name, username } = request.body;

  const verifyUser = users.find(user => user.username === username);

  if (verifyUser) {
    return response.status(400).json({ error: 'This user already exists' });
  }

  const user = {
    id: uuidv4(),
    name: name,
    username: username,
    todos: []
  }

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.json(user.todos);

});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const todo = {
    id: uuidv4(), // precisa ser um uuid
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo);
  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;
  const todoVerify = user.todos.find(todo => todo.id === id);
  if(!todoVerify){
    return response.status(404).json({error: 'Todo does not exist'}); 
  }
  todoVerify.title = title;
  todoVerify.deadline = new Date(deadline);
  return response.json(todoVerify);

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const todoVerify = user.todos.find(todo => todo.id === id);
  if(!todoVerify){
    return response.status(404).json({error: 'Todo does not exist'}); 
  }
  todoVerify.done = true;
  return response.json(todoVerify);


});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const todoVerify = user.todos.findIndex(todo => todo.id === id);
  if(todoVerify === -1){
    return response.status(404).json({error: 'Todo does not exist'}); 
  }

  user.todos.splice(todoVerify,1);
  return response.status(204).json();
});

module.exports = app;