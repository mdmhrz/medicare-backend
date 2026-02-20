
import { app } from "./app";
import { config } from "./config";


const bootStrap = () => {
    try {
        app.listen(config.port, () => {
            console.log(`Server is running on http://localhost:${config.port}`);
        });
    } catch (err) {
        console.error("Failed to start the server:", err);
    }
}

bootStrap();