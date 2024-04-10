import fs, { readFileSync } from "node:fs";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const blogsObj = await axios.get(
  "https://www.googleapis.com/blogger/v3/users/09990664448436218789/blogs",
  {
    headers: { Authorization: `Bearer ${process.env.TOKEN}` },
  }
);
const blogs = blogsObj.data.items;
console.log("=============>", blogs.length);

// const blogsObj = JSON.parse(fs.readFileSync("./blogs.json", "utf-8"));
// const blogs = blogsObj.items;

const posts = { links: [] };
let count = 1;

// Function to fetch posts for a single blog
// Function to fetch posts for a single blog
const fetchPosts = async (blog) => {
  console.log(`\n${count++}`);
  console.log("=============>", blog.id, blog.name);
  let nextPageToken = null;
  const postsPerPage = 100; // Maximum number of posts per page

  do {
    const url = `${blog.posts.selfLink}?maxResults=${postsPerPage}${
      nextPageToken ? `&pageToken=${nextPageToken}` : ""
    }`;
    try {
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${process.env.TOKEN}` },
      });
      const postsArray = response.data.items;
      if (Array.isArray(postsArray)) {
        for (const post of postsArray) {
          if (post.url) {
            posts.links.push(post.url);
            console.log(post.url);
          }
        }
      } else {
        console.log(`Posts not found for blog: ${blog.id}`);
      }
      nextPageToken = response.data.nextPageToken;
    } catch (error) {
      console.log(`Error fetching posts for blog ${blog.id}:`, error);
      nextPageToken = null; // Stop pagination in case of error
    }
  } while (nextPageToken);
};

// Loop through blogs and fetch posts for each
const fetchAllPosts = async () => {
  for (const blog of blogs) {
    await fetchPosts(blog);
  }
};

// Fetch all posts and then write to file
fetchAllPosts()
  .then(() => {
    fs.writeFileSync("./posts.json", JSON.stringify(posts, null, 2));
    console.log("Posts saved to posts.json");
  })
  .catch((error) => {
    console.error("Error fetching posts:", error);
  });

const postLinks = JSON.parse(readFileSync("./posts.json", "utf-8"))["links"];
print(postLinks.length);
