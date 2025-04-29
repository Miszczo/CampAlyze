@echo off
curl.exe -X POST "http://localhost:3000/api/test-upload" ^
-F "file=@test.csv;type=text/csv" ^
-F "platform_id=meta" ^
-F "organization_id=123e4567-e89b-12d3-a456-426614174000" ^
> response.json
type response.json
pause 