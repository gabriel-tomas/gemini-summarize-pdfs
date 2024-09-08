import app from './app';

const port =  3000 || process.env.APP_PORT;
(() => {
  app.listen(port, () => {
    console.log(`Access http://localhost:${port}`);
    console.log(`Server running on port ${port}`);
  });
})();