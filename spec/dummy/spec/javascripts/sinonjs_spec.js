describe("with sinon and sinon-chai inside 'it'", function() {
  it("should be defined", function() {
    expect(sinon).to.exist
  });

  it("should be extended with sinon-chai methods", function() {
    expect(chai.Assertion.prototype.calledWith).to.exist
  });
});
