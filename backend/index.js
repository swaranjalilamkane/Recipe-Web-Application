import app from './server.js';
import RecipesDAO from './dao/RecipesDAO.js';

async function main() {
    const port = process.env.PORT || 5001;

    try {
        // Initialize in-memory RecipesDAO
        await RecipesDAO.injectDB();

        app.listen(port, "0.0.0.0", () => {
            console.log(`========================================`);
            console.log(`Recipe API Server Starting`);
            console.log(`========================================`);
            console.log(`Port: ${port}`);
            console.log(`Available endpoints:`);
            console.log(`  GET    /api/recipes`);
            console.log(`  POST   /api/recipes`);
            console.log(`  GET    /api/recipes/:id`);
            console.log(`  PUT    /api/recipes/:id`);
            console.log(`  DELETE /api/recipes/:id`);
            console.log(`  GET    /api/recipes/search`);
            console.log(`  POST   /api/recipes/rate`);
            console.log(`  GET    /api/recipes/ratings/:id`);
            console.log(`========================================`);
        });

    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

main().catch(console.error);

export default app;
