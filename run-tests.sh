#!/bin/bash

# Kolory dla lepszej czytelności
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}===== campAlyze E2E Test Runner =====${NC}"

# Uruchamianie serwera deweloperskiego, jeśli nie jest już uruchomiony
if ! curl -s http://localhost:3003 > /dev/null && ! curl -s http://localhost:3002 > /dev/null; then
  echo -e "${YELLOW}Uruchamianie serwera deweloperskiego w tle...${NC}"
  npm run dev &
  DEV_SERVER_PID=$!
  
  # Daj serwerowi czas na uruchomienie
  echo -e "${YELLOW}Czekanie na uruchomienie serwera...${NC}"
  sleep 5
else
  echo -e "${GREEN}Serwer deweloperski już działa.${NC}"
fi

# Ustawienie zmiennych środowiskowych
export NODE_ENV=test
export DEBUG=pw:api # Włącza debugowanie API Playwright
export TEST_MODE=mock # Używa mocków zamiast prawdziwego API
export MSWTRACE=1 # Włącza szczegółowe logi MSW

echo -e "${YELLOW}Uruchamianie testów E2E z flagami debugowania...${NC}"
echo -e "TEST_MODE=${TEST_MODE}"

# Uruchom testy z mockowaniem
npx playwright test --trace on --debug

# Zatrzymaj serwer deweloperski, jeśli go uruchomiliśmy
if [ ! -z "$DEV_SERVER_PID" ]; then
  echo -e "${YELLOW}Zatrzymywanie serwera deweloperskiego...${NC}"
  kill $DEV_SERVER_PID
fi

echo -e "${GREEN}===== Zakończono uruchamianie testów =====${NC}" 