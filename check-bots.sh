#!/usr/bin/env bash
# Check that AI bots get HTTP 200 from key pages
PAGES=(
  "https://www.cryptobot.ltd/"
  "https://www.cryptobot.ltd/wallet"
  "https://www.cryptobot.ltd/p2p"
  "https://www.cryptobot.ltd/buy-ton"
)
BOTS=(
  "GPTBot"
  "ClaudeBot"
  "PerplexityBot"
  "Google-Extended"
  "Googlebot"
)
printf "%-45s" "URL"
for bot in "${BOTS[@]}"; do printf "%-18s" "$bot"; done
echo ""
echo "$(printf '%0.s-' {1..45})$(printf '%0.s-' {1..90})"
for url in "${PAGES[@]}"; do
  printf "%-45s" "$url"
  for bot in "${BOTS[@]}"; do
    code=$(curl -s -o /dev/null -w "%{http_code}" -A "$bot" "$url")
    printf "%-18s" "$code"
  done
  echo ""
done
