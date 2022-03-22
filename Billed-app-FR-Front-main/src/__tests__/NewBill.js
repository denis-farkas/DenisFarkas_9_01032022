/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import mockStore from "../__mocks__/store"

jest.mock("../app/Store", () => mockStore)

//simulation
const onNavigate = () => {return}

Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then the form appear ", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      const formNewBill = document.querySelector(`form[data-testid="form-new-bill"]`)
      expect(formNewBill).toBeTruthy()
    })
  })

  describe("When I am on NewBill Page", () => {
    describe("When I upload a file", () => {
      test("Then the file handler should show a file", () => {
        document.body.innerHTML = NewBillUI()
        const newBill = new NewBill({ document, onNavigate, store: null, localStorage: window.localStorage })
        const handleChangeFile = jest.fn(() => newBill.handleChangeFile)
        const inputFile = screen.getByTestId("file")
        inputFile.addEventListener("change", handleChangeFile)
        fireEvent.change(inputFile, {
            target: {
                files: [new File(["sample.txt"], "sample.txt", { type: "text/txt" })],
            }
        })
        const numberOfFile = screen.getByTestId("file").files.length
        expect(numberOfFile).toEqual(1)
      })
    })
  })

  describe("When I upload a file which is not an image", () => {
    test("Then the error message should be display", async () => {
      document.body.innerHTML = NewBillUI()
      const newBill = new NewBill({ document, onNavigate, store: null, localStorage: window.localStorage })
      const handleChangeFile = jest.fn(() => newBill.handleChangeFile)
      const inputFile = screen.getByTestId("file")
      inputFile.addEventListener("change", handleChangeFile)
      fireEvent.change(inputFile, {
          target: {
              files: [new File(["sample.txt"], "sample.txt", { type: "text/txt" })],
          }
      })
      expect(document.querySelector(".error").style.display).toBe("block")
    })
  })

  describe("When I do fill fields in correct format and I click on submit", () => {
    test("Then I come back to bills and see the new bill added", async () => {
      document.body.innerHTML = NewBillUI()
      const newBill = new NewBill({ document, onNavigate, store: null, localStorage: window.localStorage })
      const submit = screen.getByTestId('form-new-bill')
      const inputData = {
          name: "Vol denis",
          date: "2022-10-10",
          type: "Transports",
          amount: 100,
          pct: 10,
          vat: "20",
          com: "voila",
          fileName: "facturefreemobile.jpg",
          fileUrl: "http://127.0.0.1:8080/src/assets/images/facturefreemobile.jpg"
      }

      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))
        newBill.createBill = (newBill) => newBill

      const inputType = screen.getByTestId("expense-type");
      fireEvent.change(inputType, { target: { value: inputData.type } });
     
      const inputName = screen.getByTestId("expense-name");
      fireEvent.change(inputName, {
        target: { value: inputData.name },
      });

      const inputDate = screen.getByTestId("datepicker");
      fireEvent.change(inputDate, {
        target: { value: inputData.date },
      });

      const inputAmount = screen.getByTestId("amount");
      fireEvent.change(inputAmount, {
        target: { value: inputData.amount },
      });

      const inputVat = screen.getByTestId("vat");
      fireEvent.change(inputVat, {
        target: { value: inputData.vat },
      });

      const inputPct = screen.getByTestId("pct");
      fireEvent.change(inputPct, {
        target: { value: inputData.pct },
      });

      const inputCom = screen.getByTestId("commentary");
      fireEvent.change(inputCom, {
        target: { value: inputData.com },
      });

      newBill.fileUrl = inputData.fileUrl
      newBill.fileName = inputData.fileName 
      submit.addEventListener('click', handleSubmit)
      fireEvent.click(submit)
      expect(handleSubmit).toHaveBeenCalled()
      expect(screen.queryByText("Vol denis"))
    })
  })
})


