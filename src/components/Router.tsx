import { Switch, Route } from "wouter";

export default function Router() {
  return (
    <Switch>
      <Route>
        <HomePage />
      </Route>
    </Switch>
  );
}
