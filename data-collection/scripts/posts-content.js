import fs from "node:fs";
import https from "https";
import dotenv from "dotenv";
dotenv.config();

// Read the JSON file containing blog data
const blogs = JSON.parse(fs.readFileSync("../data/blogs.json", "utf-8"))[
  "items"
];

// Function to fetch posts content for a given blog ID
function fetchPostsContent(blogId, pageToken = null) {
  return new Promise((resolve, reject) => {
    let url = `https://www.googleapis.com/blogger/v3/blogs/${blogId}/posts?key=${process.env.GOOGLE_API_KEY}`;

    // If there is a page token, add it to the URL
    if (pageToken) {
      url += `&pageToken=${pageToken}`; // Use & instead of ? to append to existing query parameters
    }

    https
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          const responseData = JSON.parse(data);
          // Resolve with the items from the current page
          resolve(responseData.items);
          // If there's a nextPageToken, recursively fetch the next page
          if (responseData.nextPageToken) {
            fetchPostsContent(blogId, responseData.nextPageToken)
              .then((nextPageItems) => {
                // Concatenate items from subsequent pages
                resolve([...responseData.items, ...nextPageItems]);
              })
              .catch((error) => {
                reject(error);
              });
          } else {
            // If there's no nextPageToken, resolve with the final items
            resolve(responseData.items);
          }
        });
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}

// Array to store promises for fetching posts content
const promises = [];

// Loop through each blog ID and push a promise for fetching its posts content
for (const blog of blogs) {
  const blogId = blog.id;
  promises.push(fetchPostsContent(blogId));
}

// Execute all promises concurrently and handle results
Promise.all(
  promises.map((promise, index) => {
    return promise.then((result) => ({ blogId: blogs[index].id, result }));
  })
)
  .then((results) => {
    // Results will contain an array of objects with blogId and corresponding posts content
    console.log(results);
  })
  .catch((error) => {
    console.error("Error fetching posts content:", error);
  });
