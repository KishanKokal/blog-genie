from langchain_community.document_loaders import WebBaseLoader
import json
from concurrent.futures import ThreadPoolExecutor


def load_content(url):
    loader = WebBaseLoader(url)
    data = loader.load()
    content = data[0].page_content.replace("\n", " ")
    return {"link": url, "content": content}


def main():
    count = 0
    with open("posts.json", "r") as f:
        data = json.load(f)
        posts = data["links"][17001:17564]

    posts_with_contents = json.loads(open("posts-with-content.json", "r").read())

    with ThreadPoolExecutor() as executor:
        futures = [executor.submit(load_content, post) for post in posts]
        for future in futures:
            result = future.result()
            posts_with_contents["posts"].append(result)
            count += 1
            print(f"Processed: {count}", result["link"])

    with open("posts-with-content.json", "w") as f:
        json.dump(posts_with_contents, f, indent=4)


if __name__ == "__main__":
    main()
