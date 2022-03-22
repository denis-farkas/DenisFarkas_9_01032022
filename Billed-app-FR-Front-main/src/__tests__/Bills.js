/**
 * @jest-environment jsdom
 */

import {fireEvent, screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import Bills from "../containers/Bills"
import { ROUTES, ROUTES_PATH} from "../constants/routes.js"
import { bills } from "../fixtures/bills.js"
import {localStorageMock} from "../__mocks__/localStorage.js"
import mockStore from "../__mocks__/store"
import userEvent from "@testing-library/user-event"
import router from "../app/Router.js"

jest.mock("../app/Store", () => mockStore)

const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({
    pathname
  })
}

Object.defineProperty(window, 'localStorage', { 
  value: localStorageMock })

window.localStorage.setItem('user', JSON.stringify({
  type: 'Employee'
}))


describe("Given I am connected as an employee", () => {
  
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon.classList.contains('active-icon')).toBe(true)
    })
  })

  describe("When I am on Bills page but it's loading", () => {
    test('Then I should land on a loading page', () => {
      // build user interface
      const html = BillsUI({
        data: [],
        loading: true
      })
      document.body.innerHTML = html

      // screen should show Loading
      expect(screen.getAllByText('Loading...')).toBeTruthy();
    })
  })

  describe('When I am on Bills page but back-end send an error message', () => {
    test('Then I should land on an error page', () => {
      // build user interface
      const html = BillsUI({
        data: [],
        loading: false,
        error: 'Whoops!'
      });
      document.body.innerHTML = html;

      // screen should show Erreur
      expect(screen.getAllByText('Erreur')).toBeTruthy();
    })
  })

  describe("When I am on Bills Page", () => {
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })


  describe("When I click on the eye icon", () => {
    test("A modal should open", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const testBill = new Bills({ document, onNavigate, store: null, localStorage: window.localStorage })
      testBill.handleClickIconEye = jest.fn()
      screen.getAllByTestId("icon-eye")[0].click()
      expect(testBill.handleClickIconEye).toBeCalled()
      expect(document.querySelector(".modal")).toBeTruthy()
    })
  })  

  // handleClickNewBill for container/Bills.js
  
  describe('When I click on the New Bill button', () => {
    test('Then, it should render NewBill page', () => {

      // build user interface
      const html = BillsUI({
        data: []
      })
      document.body.innerHTML = html;
      
      const store = null;

      // Init Bills
      const allBills = new Bills({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      })

      // Mock handleClickNewBill
      const handleClickNewBill = jest.fn(allBills.handleClickNewBill)
      // Get button eye in DOM
      const billBtn = screen.getByTestId('btn-new-bill')

      // Add event and fire
      billBtn.addEventListener('click', handleClickNewBill)
      fireEvent.click(billBtn)

      // screen should show Envoyer une note de frais
      expect(screen.getAllByText('Envoyer une note de frais')).toBeTruthy()
    })
  })

  // test d'intégration GET
  describe("When I navigate to Bills", () => {
    test("fetches bills from mock API GET", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByText("Mes notes de frais"))
      const contentTransports  = await screen.getAllByText("Transports")
      expect(contentTransports[0]).toBeTruthy()
      expect(screen.getByTestId("btn-new-bill")).toBeTruthy()
    })
  })

  describe("When an error occurs on API", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills")
      Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
      )
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "a@a"
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })

    test("fetches bills from an API and fails with 404 message error", async () => {

      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }})
      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })

    test("fetches messages from an API and fails with 500 message error", async () => {

      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }})

      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})


