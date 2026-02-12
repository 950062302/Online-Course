#!/bin/bash

echo "Git compression error fix script..."

# 1. Git konfiguratsiyasini tozalash
git config --global --unset core.compression 2>/dev/null
git config --global --unset core.loosecompression 2>/dev/null

# 2. To'g'ri siqish usulini o'rnatish
git config --global core.compression 0
git config --global core.loosecompression 0

# 3. Git cache'ni tozalash
git rm -r --cached . 2>/dev/null
git reset HEAD 2>/dev/null

# 4. Git'ni to'liq tozalash va qayta boshlash
git clean -fd 2>/dev/null
git reset --hard HEAD 2>/dev/null

# 5. Garbage collection
git gc --prune=now 2>/dev/null

echo "Git configuration updated. Please try your git operation again."