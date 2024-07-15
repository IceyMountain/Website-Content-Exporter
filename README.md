# Website Content Exporter
A tool that allows you to export all the text content from a website, including its subdomains and pages.

## Features
- Recursively fetches and extracts text content from a specified website and its subpages.
- Saves the extracted text content to a text file.
- Caches visited URLs to avoid re-fetching.
- Supports limiting the depth of recursive fetching.
- Limits the number of concurrent requests to avoid overloading the target website.

## Installation
1. Clone the repository:
    ```sh
    git clone https://github.com/IceyMountain/Website-Content-Exporter.git
    cd website-content-exporter
    ```

2. Install the required dependencies:
    ```sh
    npm install
    ```

## Usage
Run the script with the URL of the website you want to export text content from:
```sh
node index.js https://www.wikipedia.org/
```

## Contributions
Contributions are welcome! Please open an issue or submit a pull request for any improvements or new features.
