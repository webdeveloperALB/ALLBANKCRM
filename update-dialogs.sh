#!/bin/bash

# This script updates all components to use custom ConfirmDialog instead of browser confirm/alert

FILES=(
  "/tmp/cc-agent/59344908/project/components/user-crypto-transactions-card.tsx"
  "/tmp/cc-agent/59344908/project/components/user-external-accounts-card.tsx"
  "/tmp/cc-agent/59344908/project/components/user-cards-management.tsx"
  "/tmp/cc-agent/59344908/project/components/user-taxes-card.tsx"
  "/tmp/cc-agent/59344908/project/components/user-crypto-balances-card.tsx"
  "/tmp/cc-agent/59344908/project/components/balance-manager.tsx"
  "/tmp/cc-agent/59344908/project/components/user-balances-card.tsx"
  "/tmp/cc-agent/59344908/project/components/user-edit-dialog.tsx"
  "/tmp/cc-agent/59344908/project/components/client-crypto-section.tsx"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing $(basename $file)..."
    grep -n "confirm(\|alert(" "$file" 2>/dev/null || echo "  No confirms/alerts found"
  fi
done
