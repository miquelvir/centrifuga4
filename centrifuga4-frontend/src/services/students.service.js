
class StudentsDataService {
  getAll(params) {
    return {
        "data": [
            {
                "name": "john"
            },
            {
                "name": "mary"
            },
            {
                "name": "julia"
            },
            {
                "name": "mark"
            },
            {
                "name": "ezequiel"
            }
        ]
    }
  }

  // other CRUD methods
}

export default new StudentsDataService();