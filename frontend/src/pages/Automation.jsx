import React, { useState } from "react";
import Sidebar from "../components/layout/SideBar";
import Header from "../components/layout/Header";
import Button from "../components/ui/Button";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { MdToggleOn, MdToggleOff } from "react-icons/md";


const Automation = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskName, setTaskName] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [isEnabled, setIsEnabled] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);

  const [tasks, setTasks] = useState([
    {
      name: "Weekly Report",
      description: "Send weekly performance reports via email.",
      enabled: true,
    },
    {
      name: "Monthly Cleanup",
      description: "Delete old logs and unused files every month.",
      enabled: false,
    },
  ]);

  const handleAddOrUpdateTask = (e) => {
    e.preventDefault();
    if (!taskName.trim() || !taskDescription.trim()) return;

    const newTask = {
      name: taskName,
      description: taskDescription,
      enabled: isEnabled,
    };

    const updatedTasks = [...tasks];
    if (editingIndex !== null) {
      updatedTasks[editingIndex] = newTask;
    } else {
      updatedTasks.push(newTask);
    }

    setTasks(updatedTasks);
    resetForm();
  };

  const resetForm = () => {
    setTaskName("");
    setTaskDescription("");
    setIsEnabled(false);
    setEditingIndex(null);
    setIsModalOpen(false);
  };

  const handleEdit = (index) => {
    const task = tasks[index];
    setTaskName(task.name);
    setTaskDescription(task.description);
    setIsEnabled(task.enabled);
    setEditingIndex(index);
    setIsModalOpen(true);
  };

  const handleDelete = (index) => {
    const updatedTasks = tasks.filter((_, i) => i !== index);
    setTasks(updatedTasks);
  };

  const handleToggle = (index) => {
    const updatedTasks = tasks.map((task, i) =>
      i === index ? { ...task, enabled: !task.enabled } : task
    );
    setTasks(updatedTasks);
  };

  return (
    <div className="flex h-screen bg-white">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto flex gap-6">
            <div className="flex-1 bg-white shadow-[0_4px_8px_rgba(0,0,0,0.1)] rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Automation Tasks</h2>
                <Button
                  className=" text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                  onClick={() => setIsModalOpen(true)}
                >
                  Add Task
                </Button>
              </div>

              <div className="space-y-6">
                {tasks.map((task, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg shadow-md transform transition-transform duration-200 hover:scale-[1.02] hover:shadow-lg bg-white"
                  >
                    <p className="text-sm font-medium">{task.name}</p>
                    <p className="text-sm text-gray-500 mb-2">{task.description}</p>
                    <div className="flex items-center gap-4">
                      <FiEdit className="cursor-pointer" onClick={() => handleEdit(index)} />
                      {task.enabled ? (
                        <MdToggleOn
                          className="text-600 text-[#7047D1] text-2xl cursor-pointer"
                          onClick={() => handleToggle(index)}
                        />
                      ) : (
                        <MdToggleOff
                          className="text-red-200 text-2xl cursor-pointer"
                          onClick={() => handleToggle(index)}
                        />
                      )}
                      <FiTrash2
                        className="text-red-600 cursor-pointer"
                        onClick={() => handleDelete(index)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-[300px] bg-white shadow-md rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-3">Select a Task</h2>
              <p className="text-sm mb-1">
                <strong>Description:</strong> No task selected.
              </p>
              <p className="text-sm">
                <strong>Status:</strong> N/A
              </p>
            </div>
          </div>
        </main>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
              <h2 className="text-xl font-semibold mb-4">
                {editingIndex !== null ? "Edit Task" : "Add Task"}
              </h2>
              <form onSubmit={handleAddOrUpdateTask}>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Task Name"
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                    required
                    className="w-full border rounded px-3 py-2"
                  />
                  <textarea
                    placeholder="Task Description"
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                    required
                    className="w-full border rounded px-3 py-2"
                    rows={4}
                  />
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      onChange={(e) => setIsEnabled(e.target.checked)}
                    />
                    Enable Task
                  </label>
                </div>
                <div className="flex justify-end gap-4 mt-6">
                  <Button
                    type="button"
                    onClick={resetForm}
                    className="text-gray-600 hover:text-black"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="text-blue-600 font-semibold hover:text-blue-800"
                  >
                    {editingIndex !== null ? "Update" : "Add"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Automation;
