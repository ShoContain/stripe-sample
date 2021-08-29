# tables

- user
    - login_id
    - password(hash)
    
- account 
    - user_id
    - stripe_account_id
    ....

- products
    - name
    - amount
    - user_id
    - url

- settlement
    - product_id
    - user_id
    - created_at