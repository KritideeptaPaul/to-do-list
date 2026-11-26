def show_menu():
    print("\n=== To-Do List ===")
    print("1. Add Task")
    print("2. View Tasks")
    print("3. Update Task")
    print("4. Remove Task")
    print("5. Exit\n")


def task_exists(todo_list, task_name):
    return any(t.lower() == task_name.lower() for t in todo_list)


def get_task_index(todo_list, prompt):
    raw = input(prompt).strip()
    if raw == "0":
        print("Action cancelled.")
        return None
    try:
        task_no = int(raw)
    except ValueError:
        print("Please enter a valid number.")
        return None

    if 1 <= task_no <= len(todo_list):
        return task_no - 1

    print("Invalid task number.")
    return None


def add_task(todo_list):
    task = input("Enter Task: ").strip()
    if not task:
        print("Task cannot be empty.")
        return
    if task_exists(todo_list, task):
        print("Task already exists in the list.")
        return

    todo_list.append(task)
    print(f"Task Added: {task}")


def view_tasks(todo_list):
    if not todo_list:
        print("No tasks found.")
        return
    print("\nYour To-Do List:")
    for idx, task in enumerate(todo_list, start=1):
        print(f"{idx}. {task}")


def update_task(todo_list):
    if not todo_list:
        print("No task to update.")
        return

    view_tasks(todo_list)
    idx = get_task_index(todo_list, "\nEnter task number to update (0 to cancel): ")
    if idx is None:
        return

    new_task = input("Enter New Task: ").strip()
    if not new_task:
        print("Task cannot be empty.")
        return

    old_task = todo_list[idx]
    if new_task.lower() == old_task.lower():
        print("No changes made (task is the same).")
        return
    if task_exists(todo_list, new_task):
        print("Task already exists in the list.")
        return

    todo_list[idx] = new_task
    print(f"Task Updated: {old_task} → {new_task}")


def remove_task(todo_list):
    if not todo_list:
        print("No task to remove.")
        return

    view_tasks(todo_list)
    idx = get_task_index(todo_list, "\nEnter task number to remove (0 to cancel): ")
    if idx is None:
        return

    removed_task = todo_list.pop(idx)
    print(f"Removed: {removed_task}")


def main():
    todo_list = []
    try:
        while True:
            show_menu()
            choice = input("Enter your choice: ").strip()

            match choice:
                case "1":
                    add_task(todo_list)
                case "2":
                    view_tasks(todo_list)
                case "3":
                    update_task(todo_list)
                case "4":
                    remove_task(todo_list)
                case "5":
                    print("Exiting To-Do List.")
                    break
                case _:
                    print("Invalid choice. Please select from the menu.")
    except (KeyboardInterrupt, EOFError):
        print("\nExiting To-Do List.")


if __name__ == "__main__":
    main()