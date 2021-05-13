'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    return queryInterface.bulkInsert('auth_clients', [{
      clientId: 'firelab',
      clientSecret: 'cadb2668033deb03245e79a4ee069075',
      accessToken: '62bfc8303ccf5247e0852a31450551f385d25a38de80ffdb206901e27ef876e3',
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
     return queryInterface.bulkDelete('auth_clients', null, {});
  }
};
