node dns-save/save-q.js >> logs/save.log 2>&1;
mv logs/save.log logs/$(date "+%y.%m.%d_%H-%M-%S").log