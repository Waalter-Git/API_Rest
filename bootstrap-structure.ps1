New-Item -ItemType Directory -Force -Path @(
  'src/config',
  'src/middleware',
  'src/features/users',
  'src/features/assets',
  'src/features/tickets',
  'src/utils',
  'src/types'
) | Out-Null
