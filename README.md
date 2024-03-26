# Serve

Serve is a simple Node.js application that allows you to quickly serve static and dynamic html page from a specified directory. It also includes a live reload feature, which automatically refreshes the browser when changes are made to HTML, CSS, or JavaScript files.


## Installation
  ------------

  * Clone the repository to your local machine and cd into it and run `npm install`, or just copy paste below commands:

    ```
    git clone https://github.com/theyashsolanki/serve.git ~/.serve
    cd ~/.serve
    npm install
    ```
  * export the `~/.serve/bin/` path in your `.bashrc` or `.zshrc` file.
    * for bash:
    ```
    echo 'export PATH=$HOME/.serve/bin:$PATH' >> ~/.bashrc
    ```
    * for zsh:
    ```
    echo 'export PATH=$HOME/.serve/bin:$PATH' >> ~/.zshrc
    ```
    

# Usage
  ------------
  The script serves a specified HTML file and provides options for customization.

  ## Syntax:
  
     serve [OPTIONS] [FILE]
  
  ***Note that the order of arguments does not matter.***
  
  ## Options:
  
  * `-p` : Specifies the port number to use for serving the HTML file. Default port is 3005.
   
  * `-r` : Enables the live reload feature, which automatically refreshes the browser when changes are made to HTML, CSS, or JavaScript files in the served directory.
   
  * `[FILE]` : Path to the HTML file to be served. If not specified, defaults to "index.html" in the current directory.
  
  * `-d` : enable dynamic mode
  

  ## Examples:
  1. Serve "index.html" in the current directory on port 3005:
    
    serve

  2. Serve "index.html" on port 8080 with live reload enabled:
     
    serve -p 8080 -r

  3. Serve "main.html" on port 3000 with live reload enabled:
    
    serve main.html -r -p 3000
    

## Built With

Node.js, bash
