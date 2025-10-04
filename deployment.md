# Deployment Guide: Node.js Backend on AWS EC2 with Nginx and Certbot

## 1. Launch EC2 Instance
- Choose Ubuntu Server (recommended) or Amazon Linux.
- Select instance type (t2.micro for small apps).
- Create or use an existing key pair for SSH access.
- Attach a security group (see step 2).

## 2. Configure Security Group (Inbound Rules)
- Allow SSH: TCP 22 (your IP only)
- Allow HTTP: TCP 80 (0.0.0.0/0)
- Allow HTTPS: TCP 443 (0.0.0.0/0)

## 3. Connect to EC2 via SSH
```
ssh -i /path/to/key.pem ubuntu@<EC2_PUBLIC_IP>
```

## 4. Install Node.js, npm, and pm2
```
sudo apt update && sudo apt install -y nodejs npm
```

## 5.  Set Up GitHub Actions Runner

### Clone your repository
```
git clone <your-repo-url>
cd <repo-folder>
```

### Set up GitHub Actions self-hosted runner
If you want to run GitHub Actions jobs directly on this EC2 instance:
```
# Install dependencies for the runner
sudo apt update && sudo apt install -y curl tar

# Download and set up the runner (replace version as needed)
mkdir actions-runner && cd actions-runner
curl -o actions-runner-linux-x64-2.316.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.316.0/actions-runner-linux-x64-2.316.0.tar.gz
tar xzf ./actions-runner-linux-x64-2.316.0.tar.gz

# Get your repo's registration token from GitHub (Settings > Actions > Runners > New self-hosted runner)
# Then configure the runner (replace <owner>, <repo>, and <TOKEN>)
./config.sh --url https://github.com/<owner>/<repo> --token <TOKEN>

# Start the runner (in background)
./run.sh &
```
- For production, consider setting up the runner as a systemd service for auto-start.

## 6. Install and Configure PM2 (Process Manager)
```
sudo npm install -g pm2
pm2 start src/server.js --name ownmali-backend
pm2 startup
pm2 save
```

## 7. Install Nginx
```
sudo apt install -y nginx
```

## 8. Configure Nginx as Reverse Proxy
- Edit `/etc/nginx/sites-available/default` or create a new config:
```
sudo nano /etc/nginx/sites-available/ownmali
```
- Example config:
```
server {
    listen 80;
    server_name <your-domain.com>;

    location / {
        proxy_pass http://localhost:3000; # Change port if needed
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
- Enable config and restart Nginx:
```
sudo ln -s /etc/nginx/sites-available/ownmali /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 9. Install Certbot and Obtain SSL Certificate
```
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d <your-domain.com>
```
- Follow prompts to complete SSL setup.
- Certbot will auto-renew certificates.

## 10. Test Everything
- Visit `https://<your-domain.com>` to verify SSL and backend are working.
- Check Nginx and PM2 status if issues arise:
```
sudo systemctl status nginx
pm2 status
```

## 11. (Optional) Set Environment Variables
- Use `.env` file or set variables in PM2 ecosystem config.

## 12. GitHub Actions CI/CD with PM2

You can automate deployment using GitHub Actions. This workflow will SSH into your EC2 instance, pull the latest code, install dependencies, and restart your app with PM2.

### Prerequisites
- Your EC2 instance must allow SSH from GitHub Actions IPs (or use a bastion/jump host).
- Add your EC2 server's SSH private key as a GitHub Secret (e.g., `EC2_SSH_KEY`).
- Add your EC2 server's public IP/hostname and username as GitHub Secrets (e.g., `EC2_HOST`, `EC2_USER`).

### Example Workflow: `.github/workflows/deploy.yml`
```yaml
name: Deploy to EC2
on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up SSH
        uses: webfactory/ssh-agent@v0.9.0
        with:
          ssh-private-key: ${{ secrets.EC2_SSH_KEY }}

      - name: Deploy to EC2
        run: |
          ssh -o StrictHostKeyChecking=no ${{ secrets.EC2_USER }}@${{ secrets.EC2_HOST }} '
            cd /path/to/your/app &&
            git pull &&
            npm install &&
            pm2 restart ownmali-backend || pm2 start src/server.js --name ownmali-backend
          '
```
- Adjust `/path/to/your/app` and PM2 process name as needed.
- For more security, use deploy keys or GitHub OIDC for SSH.

## 13. Using a Self-Hosted GitHub Actions Runner (on EC2)

You can run GitHub Actions jobs directly on your EC2 instance for faster deployments and more control.

### Steps to Set Up a Self-Hosted Runner
1. **On your EC2 instance:**
   - Install required dependencies:
     ```
     sudo apt update && sudo apt install -y curl tar
     ```
   - Create a directory for the runner and download it:
     ```
     mkdir actions-runner && cd actions-runner
     curl -o actions-runner-linux-x64-2.316.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.316.0/actions-runner-linux-x64-2.316.0.tar.gz
     tar xzf ./actions-runner-linux-x64-2.316.0.tar.gz
     ```
   - Get your repository's runner registration token from GitHub:
     - Go to your repo → Settings → Actions → Runners → New self-hosted runner → Linux → x64
   - Configure the runner (replace TOKEN and URL):
     ```
     ./config.sh --url https://github.com/<owner>/<repo> --token <TOKEN>
     ```
   - Start the runner (in background):
     ```
     ./run.sh &
     ```
   - (Optional) Set up as a systemd service for auto-start.

2. **Update your workflow to use the self-hosted runner:**
   - Change `runs-on: ubuntu-latest` to `runs-on: self-hosted`:
   ```yaml
   jobs:
     deploy:
       runs-on: self-hosted
       steps:
         # ...existing steps...
   ```

3. **Security Tips:**
   - Only use self-hosted runners for trusted repositories.
   - Keep your EC2 instance secure and up to date.
   - Remove the runner if the server is compromised.

## 14. Example: Node.js CI/CD Workflow with Yarn and PM2 (Self-Hosted Runner)

Below is an example GitHub Actions workflow for a self-hosted runner that:
- Installs dependencies with Yarn
- Builds the project
- Manages the app process with PM2

Save this as `.github/workflows/nodejs-ci.yml` in your repository:

```yaml
name: Node.js CI

on:
  push:
    branches: [ "main" ]

jobs:
  build:
    runs-on: self-hosted
    strategy:
      matrix:
        node-version: [24.x]
    steps:
      - uses: actions/checkout@v4
      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'yarn'
      - name: Install dependencies with Yarn
        run: yarn install --frozen-lockfile
      - name: Build the project
        run: yarn build
      - name: Start the app with PM2
        run: |
          if pm2 list | grep -q 'ownmali-api'; then
            pm2 stop ownmali-api
            pm2 delete ownmali-api
          fi
          pm2 start dist/server.js --name ownmali-api
          pm2 save
```

- Make sure your build output is at `dist/server.js` or adjust the path as needed.
- The workflow will stop and delete any existing `ownmali-api` process before starting a new one.
- This workflow assumes Yarn is used for dependency management and building.

---

**Tip:** For production, restrict SSH to your IP, keep your system updated, and use strong passwords/keys.
