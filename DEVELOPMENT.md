# Development Flow

### Branches
* feat / fix
  * This contains the changes needed depending on the issue number. either `feat/#123` or `fix/#123` branch
  * this is the only branch you can commit changes specifically to the needed change
  * no url available
* develop
  * Can be broken for testing purposes
  * changes should reflect on https://dev-smartlink-dex.netlify.app/
* staging
  * This branch should not be broken and feat/fix branches only be merged when the changes are working as expected and approved.
  * changes should reflect on https://staging-smartlink-dex.netlify.app/
* master
  * Production branch where we select staging updates and reflect it on live
  * changes should reflect on https://app.smartlink.so/


### Step by Step Development Flow

1. Checkout from staging and create feat/fix branch with the issue number. 
    * All feat/fix branches are created off the latest working code state of a project
  ```
    git checkout staging
    git fetch origin
    git reset --hard origin/staging
    git checkout -b feat/#ISSUE_NUMBER
  ```

2. After finishing the feat or fix, merge it to develop and check if the changes are working properly on the develop environment
  ```
    // commit & push changes on feat/fix branch
    git add .
    git commit -m "message"
    git push

    // merge changes to develop for checking
    git checkout develop
    git merge feat/#ISSUE_NUMBER
    git push
  ```

3. If the changes are not working properly or there are needed changes, go back to your feat/fix branch to apply those changes
    * Avoid making changes directly to develop branch
    * Repeat #2 after making changes
  ```
    git checkout feat/#ISSUE_NUMBER // to go back
  ```

4. If the changes are all good and approved create a PR according to the issue number and will be merged to staging by the authorized individual.

5. staging will be merged to master when we want to have the change to be reflected in our live website
