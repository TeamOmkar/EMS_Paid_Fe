import React, { useState, useEffect } from "react";

const App = () => {
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState(() => JSON.parse(localStorage.getItem("tasks")) || {});
  const [taskInput, setTaskInput] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [search, setSearch] = useState("");

  // Fetch employees from API using a CORS proxy
  const fetchEmployees = async () => {
    try {
      const response = await fetch(
        "https://cors-anywhere.herokuapp.com/https://ems-backend-2.vercel.app/employees"
      );
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Save tasks to local storage whenever they change
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const assignTask = () => {
    if (selectedEmployee && taskInput) {
      setTasks((prevTasks) => ({
        ...prevTasks,
        [selectedEmployee]: [...(prevTasks[selectedEmployee] || []), { task: taskInput, completed: false }],
      }));
      setTaskInput("");
      setSelectedEmployee("");
    }
  };

  const markTaskCompleted = (employeeId, taskIndex) => {
    const password = prompt("Enter Admin Password:");
    if (password === "admin") {
      setTasks((prevTasks) => {
        const updatedTasks = { ...prevTasks };
        updatedTasks[employeeId][taskIndex].completed = true;
        return updatedTasks;
      });
    } else {
      alert("Incorrect Password!");
    }
  };

  const filteredEmployeesWithTasks = search
    ? employees
        .filter(
          (employee) =>
            employee.first_name.toLowerCase().includes(search.toLowerCase()) ||
            employee.last_name.toLowerCase().includes(search.toLowerCase())
        )
        .map((employee) => ({
          ...employee,
          tasks: tasks[employee.id] || [],
        }))
    : employees.map((employee) => ({
        ...employee,
        tasks: tasks[employee.id] || [],
      }));

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Employee Task Assigner</h1>

      <div className="mb-4">
        <select
          className="border rounded p-2 w-full"
          value={selectedEmployee}
          onChange={(e) => setSelectedEmployee(e.target.value)}
        >
          <option value="">Select Employee</option>
          {employees.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.first_name} {employee.last_name}
            </option>
          ))}
        </select>
        <input
          type="text"
          className="border rounded p-2 w-full mt-2"
          placeholder="Enter Task"
          value={taskInput}
          onChange={(e) => setTaskInput(e.target.value)}
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
          onClick={assignTask}
        >
          Assign Task
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          className="border rounded p-2 w-full"
          placeholder="Search Employee by Name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div>
        {filteredEmployeesWithTasks.map((employee) => (
          <div key={employee.id} className="border rounded p-4 mb-4">
            <h2 className="font-bold mb-2">
              Tasks for {employee.first_name} {employee.last_name}
            </h2>
            {employee.tasks.length > 0 ? (
              employee.tasks.map((task, index) => (
                <div
                  key={index}
                  className={`p-2 border rounded mb-2 ${
                    task.completed ? "bg-green-100" : "bg-red-100"
                  }`}
                >
                  <p>{task.task}</p>
                  <p>Status: {task.completed ? "Completed" : "Pending"}</p>
                  {!task.completed && (
                    <button
                      className="bg-green-500 text-white px-2 py-1 rounded mt-2"
                      onClick={() => markTaskCompleted(employee.id, index)}
                    >
                      Mark as Completed
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p>No tasks assigned.</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
