function connect() {
  console.log(
    'I am a server-side dependency for route loader. I should not bundle into client side!',
  );
}

export default connect;
