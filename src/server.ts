import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // Process image endpoint
  // GET /filteredimage?image_url={{URL}}
  // Downloads image from public URL, resizes it, and returns it
  app.get("/filteredimage", async (req: Request, res: Response) => {
    const { image_url } = req.query;

    if(!image_url){
      res.status(422).send({message: "Please provide image URL as query string parameter"});
    }

    try {
      const filteredpath = await filterImageFromURL(image_url);
      res.sendFile(filteredpath);

      // Delete image file after response
      res.on("finish", function() {
        deleteLocalFiles([filteredpath]);
      });
    } catch {
      res.status(422).send({message: `Please make sure the URL ${image_url} points to an image and try again`});
    }
  });

  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}");
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();