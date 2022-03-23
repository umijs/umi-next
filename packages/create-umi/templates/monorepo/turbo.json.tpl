{
  "$schema": "https://turborepo.org/schema.json",
  "baseBranch": "origin/master",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    }
  },
  "globalDependencies": []
}
