# Backend Routes
### Follow the given syntax when making http requests to the backend

> #### /auth/login
> HTTP method: POST
> Expected Parameters(json): {email, password}
> Returns (json): {token, user_id}
> Exceptions: InputError when email doesn't exist or wrong password

> #### /feedback
> HTTP method: POST
> Expected Parameters(json): {Feedback, Rating}
> Returns (json): {confirmation}
> Exceptions: InputError when no data is given in either feedback section or rating. also error raised if unable to add to DB.