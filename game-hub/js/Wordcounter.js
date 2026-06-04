function countWords() {
    const textInput = document.getElementById('textInput').value.trim();
    const wordCount = textInput === '' ? 0 : textInput.split(/\s+/).length;
    document.getElementById('wordCount').textContent = `Word Count: ${wordCount}`;
}