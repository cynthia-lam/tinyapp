# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly). Users can create, edit, and delete shortened URLs when logged in to their account, but shortened URLs can be shared with anyone!

I created this project as part of my Web Development journey at Lighthouse Labs. This is my first app of any kind and I cannot express in words how much I learned. I made so many mistakes along the way (yay, fun!) and through them I have gained several hours of troubleshooting experience, added new tricks to my repertoire, and now have good coding conventions stuck in the back of my mind at all times. Please enjoy!


## Final Product

You can login or register using the buttons on the top right by providing an email and password

!["Login Page"](https://github.com/cynthia-lam/tinyapp/blob/master/docs/login-page.png)

Once logged in, you can view the URLs you've shortened

!["My URLs Page"](https://github.com/cynthia-lam/tinyapp/blob/master/docs/urls-page.png)

If you click "Create New URL" in the header, you will be taken to a page where you can input a URL to shorten

!["New URL Page"](https://github.com/cynthia-lam/tinyapp/blob/master/docs/new-url-page.png)

After you shorten a URL, or through the edit option on your URL page, you can view and change your URLs!
!["URL Details"](https://github.com/cynthia-lam/tinyapp/blob/master/docs/show-url-page.png)


## Dependencies

- Node.js
- Express
- EJS
- bcryptjs
- cookie-session

It also includes tests run with

- mocha
- chai
- chai-http

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.
- Have fun!