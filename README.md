# 📚 After School Backend

This is the **backend** for the After School web application. It provides **REST API endpoints** to manage lessons and customer orders.

The service is built with **Node.js** and **Express.js**, using **MongoDB Atlas** for data persistence.

---

## ✨ Features and Endpoints

| Feature | Method | Path | Description |
| :--- | :--- | :--- | :--- |
| **Get All Lessons** | `GET` | `/api/lessons` | Retrieves the list of all available lessons. |
| **Create an Order** | `POST` | `/api/orders` | Submits a new customer order. |
| **Update Lesson Availability** | `PUT` | `/api/lessons/:id` | Adjusts the space/availability for a specific lesson. |

* Serves lesson images from the `/images` directory.
* Includes a logging middleware to track all incoming requests.

---

## 💻 Running Locally

Follow these steps to set up and run the server on your local machine:

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/Ben9955/after-school-backend
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a file named `.env` in the root directory with the following variables:
    ```
    PORT=3000
    MONGODB_URI=<your MongoDB Atlas connection string>
    ```

4.  **Start the Server:**
    ```bash
    npm start
    ```
    The server will be running on `http://localhost:3000` (or the port specified in your `.env` file).

---

## 🔗 Project Links

* **GitHub Repository:** `https://github.com/Ben9955/after-school-backend`
* **Render Deployment URL:** `https://after-school-backend-564j.onrender.com`

---

## 💡 Notes

* Data is stored in two MongoDB collections: `lessons` and `orders`.
* All endpoints can be tested using the provided **Postman Collection**.
* The logging middleware outputs detailed request information directly to the server console.