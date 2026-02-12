#!/bin/bash

echo "Git corruption quick fix..."

# 1. Git konfiguratsiyasini to'g'rilash
git config core.compression 0
git config core.loosecompression 0

# 2. Cache'ni tozalash
git rm -r --cached . 2>/dev/null || true
git reset HEAD 2>/dev/null || true

# 3. Garbage collection
git gc --prune=now 2>/dev/null || true

# 4. Filesystem check
git fsck --full --dangling 2>/dev/null || true

# 5. Agar hali xato bo'lsa
echo "Agar yuqoridagi ishlamasa, quyidagilarni sinab ko'ring:"
echo "git reset --hard HEAD"
echo "git clean -fd"
echo "git push origin main --force"

echo "Tugadi. Git operatsiyasini qayta urining."