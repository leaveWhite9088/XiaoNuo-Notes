module.exports = {
  eslintConfig: {
    extends: ["react-app", "react-app/jest"]
  },
  jest: {
    transformIgnorePatterns: [
      "node_modules/(?!(react-player|axios)/)"
    ]
  }
}
