from rest_framework.response import Response
from rest_framework.decorators import api_view
from langchain_community.document_loaders import WebBaseLoader


@api_view(["GET"])
def health(request):
    return Response({"status": "ok -v2"})


@api_view(["POST"])
def content(request):
    url = request.data["url"]
    loader = WebBaseLoader(url)
    data = loader.load()
    content = data[0].page_content.replace("\n", " ")

    return Response({"content": content})
