import fs from "node:fs";

// const posts1 = JSON.parse(
//   fs.readFileSync("../data/posts-with-embeddings.json")
// );

// const posts2 = JSON.parse(
//   fs.readFileSync("../data/posts-with-embeddings-2.json")
// );

// const posts = posts1.concat(posts2);

// fs.writeFileSync("../data/embeddings.json", JSON.stringify(posts));

const posts = JSON.parse(fs.readFileSync("../data/embeddings.json"));
console.log(posts.length);
console.log(posts[0]);
