import { render, screen } from '@testing-library/react'
import Home from '../pages/index'

describe('Home', () => {
  it('renders title', () => {
    render(<Home />)
    expect(screen.getByText(/OS User Frontend/i)).toBeInTheDocument()
  })
})
