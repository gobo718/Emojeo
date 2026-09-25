#!/data/data/com.termux/files/usr/bin/bash
set -e
cd ~/Emojeo
echo "Deploying Emojeo Pass 76 server runner..."
npx wrangler deploy --config wrangler-step4-pass76.toml
echo
echo "COPY the workers.dev URL printed above."
echo "Then open the Pass 76 acceptance page and paste that URL into Runner URL."
